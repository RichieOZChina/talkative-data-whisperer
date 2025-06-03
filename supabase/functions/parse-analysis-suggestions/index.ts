
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analysisId, content, datasetId } = await req.json();

    if (!analysisId || !content || !datasetId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: analysisId, content, datasetId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Parsing analysis suggestions for analysis:', analysisId);

    // Parse the content to extract individual suggestions
    const suggestions = parseAnalysisSuggestions(content);
    
    console.log('Found suggestions:', suggestions.length);

    // Save each suggestion to the database
    const savedSuggestions = [];
    for (const suggestion of suggestions) {
      const { data, error } = await supabase
        .from('analysis_suggestions')
        .insert({
          dataset_id: datasetId,
          analysis_id: analysisId,
          title: suggestion.title,
          description: suggestion.description,
          analysis_type: suggestion.analysis_type,
          suggested_prompt: suggestion.suggested_prompt,
          complexity_level: suggestion.complexity_level,
          estimated_time_minutes: suggestion.estimated_time_minutes,
          required_columns: suggestion.required_columns,
          metadata: suggestion.metadata
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving suggestion:', error);
        continue;
      }

      savedSuggestions.push(data);
    }

    console.log('Saved suggestions:', savedSuggestions.length);

    return new Response(
      JSON.stringify({ 
        success: true, 
        suggestions: savedSuggestions,
        count: savedSuggestions.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in parse-analysis-suggestions function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function parseAnalysisSuggestions(content: string) {
  const suggestions = [];
  
  // Look for numbered lists that contain analysis suggestions
  const numberedListRegex = /(\d+)\.\s*\*\*(.*?)\*\*\s*-\s*(.*?)(?=\n\d+\.|\n\n|$)/gs;
  let match;
  
  while ((match = numberedListRegex.exec(content)) !== null) {
    const [, number, title, description] = match;
    
    // Extract analysis type from title or description
    const analysisType = extractAnalysisType(title, description);
    
    // Estimate complexity based on keywords
    const complexity = estimateComplexity(title, description);
    
    // Extract time estimate if mentioned
    const timeEstimate = extractTimeEstimate(description);
    
    // Extract required columns if mentioned
    const requiredColumns = extractRequiredColumns(description);
    
    suggestions.push({
      title: title.trim(),
      description: description.trim(),
      analysis_type: analysisType,
      suggested_prompt: generateSuggestedPrompt(title, description),
      complexity_level: complexity,
      estimated_time_minutes: timeEstimate,
      required_columns: requiredColumns,
      metadata: {
        order: parseInt(number),
        extracted_from_ai: true,
        confidence_score: 0.8
      }
    });
  }
  
  return suggestions;
}

function extractAnalysisType(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase();
  
  if (text.includes('defect') || text.includes('quality') || text.includes('error')) {
    return 'quality_analysis';
  } else if (text.includes('vendor') || text.includes('supplier') || text.includes('performance')) {
    return 'vendor_analysis';
  } else if (text.includes('trend') || text.includes('time') || text.includes('temporal')) {
    return 'trend_analysis';
  } else if (text.includes('cost') || text.includes('financial') || text.includes('budget')) {
    return 'cost_analysis';
  } else if (text.includes('correlation') || text.includes('relationship')) {
    return 'correlation_analysis';
  } else {
    return 'general_analysis';
  }
}

function estimateComplexity(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase();
  
  if (text.includes('advanced') || text.includes('complex') || text.includes('correlation') || text.includes('multivariate')) {
    return 'advanced';
  } else if (text.includes('comparison') || text.includes('trend') || text.includes('analysis')) {
    return 'intermediate';
  } else {
    return 'basic';
  }
}

function extractTimeEstimate(description: string): number | null {
  const timeRegex = /(\d+)\s*(minute|hour|min|hr)s?/i;
  const match = description.match(timeRegex);
  
  if (match) {
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    if (unit.startsWith('hour') || unit.startsWith('hr')) {
      return value * 60;
    } else {
      return value;
    }
  }
  
  // Default estimates based on complexity keywords
  if (description.toLowerCase().includes('advanced') || description.toLowerCase().includes('complex')) {
    return 30;
  } else if (description.toLowerCase().includes('analysis') || description.toLowerCase().includes('comparison')) {
    return 15;
  } else {
    return 10;
  }
}

function extractRequiredColumns(description: string): string[] {
  const columns = [];
  
  // Look for column names in quotes or specific patterns
  const columnRegex = /"([^"]+)"|'([^']+)'|\b([A-Z][a-z_]+(?:_[a-z]+)*)\b/g;
  let match;
  
  while ((match = columnRegex.exec(description)) !== null) {
    const column = match[1] || match[2] || match[3];
    if (column && column.length > 2 && !columns.includes(column)) {
      columns.push(column);
    }
  }
  
  return columns.slice(0, 5); // Limit to 5 columns
}

function generateSuggestedPrompt(title: string, description: string): string {
  return `Analyze the dataset to ${title.toLowerCase()}. ${description.split('.')[0]}.`;
}
