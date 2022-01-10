import axios from 'axios';
import { Api as FigmaAPI } from 'figma-api';
import { optimize } from 'svgo';

export const listComponents = async (
  token: string,
  fileId: string,
  options: Partial<{ containingPageId: string; containingNodeId: string }> = {},
) => {
  const api = new FigmaAPI({
    personalAccessToken: token,
  });
  const componentSets = await api.getFileComponentSets(fileId);
  const factors = Object.entries(options).filter((option) => {
    return (['containingPageId', 'containingNodeId'].includes(option[0])) && option[1]
  });
  return componentSets.meta?.component_sets.filter(componentSet => {
    return factors.every(factor => {
      switch (factor[0]) {
        case 'containingPageId':
          return componentSet.containing_frame?.pageId === factor[1]
        case 'containingNodeId':
          return componentSet.containing_frame?.nodeId === factor[1]
        default:
          return true;
      }
    })
  }) || [];
};

export const getOptimizedImage = async (
  token: string,
  fileId: string,
  nodeId: string,
) => {
  const api = new FigmaAPI({
    personalAccessToken: token,
  });
  const { images, err } = await api.getImage(fileId, {
    ids: nodeId,
    format: 'svg',
    scale: 1,
  });
  if (err) throw err;
  const path = images[nodeId];
  if (!path) throw new Error('Failed to generate image.');
  return optimizeSvg(nodeId, path);
};

const optimizeSvg = async (nodeId: string, filePath: string) => {
  const response = await axios.get(filePath, { responseType: 'text' });
  return {
    nodeId,
    svg: optimize(response.data, {
      plugins: [
        {
          name: 'removeViewBox',
          active: false,
        },
        {
          name: 'convertColors',
          active: true,
          params: {
            currentColor: true,
            names2hex: false,
            rgb2hex: false,
            shorthex: false,
            shortname: false,
          },
        },
      ],
    }),
  };
};
