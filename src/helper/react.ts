import dedent from 'dedent';

export const build = (body: string, name: string) => {
  return dedent`
  import type { VFC } from 'react';

  const ${name}: VFC = () => {
    return (
      ${body}
    );
  };
  ${name}.displayName = '${name}';

  export default ${name};
  `;
};
