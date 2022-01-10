export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const formatComponentName = (
  name: string,
  options: Partial<{ prefix: string }>,
) => {
  const formattedName = name
    .split(/_|-|\//)
    .map(capitalize)
    .join('');
  const componentName = options.prefix
    ? `${options.prefix}${capitalize(formattedName)}`
    : formattedName;
  return componentName;
};
