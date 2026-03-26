export interface PipelineStep {
  n: string;
  title: string;
  desc: string;
  tool: string;
  image: string | null;
}

export interface Tool {
  name: string;
  role: string;
  logo: string;
  url: string;
}
