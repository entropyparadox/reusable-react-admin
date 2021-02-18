import { startCase } from 'lodash';

export const pascalCase = (string: string) => {
  return startCase(string).replace(/ /g, '');
};
