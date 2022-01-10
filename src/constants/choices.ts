export const FRAMEWORKS = [
  {
    name: 'React',
    value: 'react',
    extension: 'tsx',
  },
  {
    name: 'Vue',
    value: 'vue',
    extension: 'vue',
  },
] as const;
export type Framework = typeof FRAMEWORKS[number]['value'];
