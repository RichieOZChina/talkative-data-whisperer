
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { datasetId } = await req.json();

    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get dataset information
    const { data: dataset, error: datasetError } = await supabase
      .from('datasets')
      .select('*')
      .eq('id', datasetId)
      .single();

    if (datasetError || !dataset) {
      console.error('Dataset not found:', datasetError);
      return new Response(
        JSON.stringify({ error: 'Dataset not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing dataset:', dataset.name);

    // Download the CSV file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('datasets')
      .download(dataset.file_path);

    if (downloadError || !fileData) {
      console.error('Error downloading file:', downloadError);
      return new Response(
        JSON.stringify({ error: 'Failed to download CSV file' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const csvContent = await fileData.text();
    
    // Get first 20 rows for analysis (including header)
    const lines = csvContent.split('\n').slice(0, 20);
    const sampleData = lines.join('\n');

    console.log('Sending data to OpenAI for analysis...');

    // Analyze with OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a data analyst expert. Analyze the provided CSV data sample and generate:
            1. A SQL CREATE TABLE statement with appropriate column names and data types
            2. A detailed analysis of each column including data type, sample values, and any patterns

            IMPORTANT: Return ONLY a valid JSON object with this exact structure (no markdown formatting, no code blocks):
            {
              "sql_schema": "CREATE TABLE table_name (...);",
              "column_analysis": [
                {
                  "column_name": "string",
                  "data_type": "string",
                  "sql_type": "string", 
                  "sample_values": ["value1", "value2"],
                  "null_count": number,
                  "unique_count": number,
                  "description": "string"
                }
              ],
              "table_name": "string",
              "total_columns": number
            }

            Use appropriate SQL data types like VARCHAR(255), INTEGER, DECIMAL(10,2), DATE, BOOLEAN, TEXT, etc.
            Make table_name a clean version of the dataset name (lowercase, underscores, no spaces).`
          },
          {
            role: 'user',
            content: `Analyze this CSV data sample:\n\n${sampleData}\n\nDataset name: ${dataset.name}`
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to analyze CSV with OpenAI' }),
        { status: openAIResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResult = await openAIResponse.json();
    let analysisResult;
    
    try {
      let content = aiResult.choices[0].message.content;
      console.log('Raw OpenAI response:', content);
      
      // Clean up the response if it contains markdown code blocks
      if (content.includes('```json')) {
        content = content.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      } else if (content.includes('```')) {
        content = content.replace(/```\s*/g, '');
      }
      
      // Trim whitespace
      content = content.trim();
      
      console.log('Cleaned content for parsing:', content);
      analysisResult = JSON.parse(content);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.error('Content that failed to parse:', aiResult.choices[0].message.content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI analysis response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('OpenAI analysis complete:', analysisResult);

    // Store the schema analysis in the database
    const { data: schemaData, error: schemaError } = await supabase
      .from('dataset_schemas')
      .insert({
        dataset_id: datasetId,
        generated_sql: analysisResult.sql_schema,
        column_analysis: analysisResult
      })
      .select()
      .single();

    if (schemaError) {
      console.error('Error storing schema:', schemaError);
      return new Response(
        JSON.stringify({ error: 'Failed to store schema analysis' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update dataset status
    await supabase
      .from('datasets')
      .update({ status: 'analyzed' })
      .eq('id', datasetId);

    console.log('Schema analysis stored successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        schema: schemaData,
        analysis: analysisResult 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-csv-metadata function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
