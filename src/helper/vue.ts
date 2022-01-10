import dedent from 'dedent';

export const build = (body: string, name: string) => {
  const templateResult = buildTemplate(body);
  const scriptResult = buildScript(name);
  const compiledComponent = templateResult + '\n\n' + scriptResult;
  return compiledComponent;
};

const buildTemplate = (body: string) => {
  return dedent`
    <template functional>
      ${body}
    </template>
  `;
};

const buildScript = (name: string) => {
  const result = dedent`
    <script>
    export default {
      name: '${name}',
    }
    </script>
  `;
  return result;
};
