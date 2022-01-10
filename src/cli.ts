#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import cac from 'cac';
import inquirer from 'inquirer';
import { listComponents, getOptimizedImage } from './helper/figma.js';
import { build as buildVue } from './helper/vue.js';
import { build as buildReact } from './helper/react.js';
import { formatComponentName } from './util/string.js';
import { Framework, FRAMEWORKS } from './constants/choices.js';

interface CliOption {
  token: string;
  outDir: string;
  containingNodeId?: string;
  containingPageId?: string;
  prefixComponentName?: string;
}

const cli = cac('figma-export-svg-to-vue');

const run = () => {
  cli
    .command('build <fileId>', 'Generate svg components for Vue')
    .option('-t, --token <token>', 'Your personal access token for Figma', {
      default: '',
    })
    .option(
      '-o, --out-dir <out-dir>',
      'Directory where component files are saved.',
      { default: './output' },
    )
    .option(
      '-p, --containing-page-id <containingPageId>',
      'Page ID of the parent that contains the target components',
    )
    .option(
      '-n, --containing-node-id <containingNodeId>',
      'Node ID of the parent that contains the target components',
    )
    .option(
      '--prefix-component-name <prefixComponentName>',
      'Prefix of the component name',
    )
    .action(async (fileId, options: CliOption) => {
      const components = await listComponents(options.token, fileId, {
        containingNodeId: options.containingNodeId,
        containingPageId: options.containingPageId,
      });
      const { nodeIds } = await inquirer.prompt<{ nodeIds: string[] }>([
        {
          type: 'checkbox',
          name: 'nodeIds',
          loop: false,
          default: null,
          choices: components.map((c) => ({ value: c.node_id, name: c.name })),
        },
      ]);
      const { framework } = await inquirer.prompt<{ framework: Framework }>([
        {
          type: 'list',
          name: 'framework',
          loop: false,
          default: null,
          choices: FRAMEWORKS,
        },
      ]);
      const selectedComponents = components.filter((c) =>
        nodeIds.includes(c.node_id),
      );
      const images = await Promise.all(
        selectedComponents.map((c) =>
          getOptimizedImage(options.token, fileId, c.node_id),
        ),
      );
      await fs.promises.access(options.outDir).catch(async () => {
        await fs.promises.mkdir(options.outDir);
      });
      await Promise.all(
        images.map(async (image) => {
          const name = formatComponentName(
            selectedComponents.find((c) => c.node_id === image.nodeId)?.name ||
              '',
            {
              prefix: options.prefixComponentName || '',
            },
          );
          const extension = FRAMEWORKS.find(
            (f) => f.value === framework,
          )?.extension;
          return fs.promises.writeFile(
            path.join(options.outDir, `${name}.${extension}`),
            build(image.svg.data, name, { framework }),
          );
        }),
      );
    });
  cli.parse();
};

const build = (
  body: string,
  name: string,
  options: { framework: 'react' | 'vue' },
) => {
  switch (options.framework) {
    case 'react':
      return buildReact(body, name);
    case 'vue':
      return buildVue(body, name);
  }
};

run();
