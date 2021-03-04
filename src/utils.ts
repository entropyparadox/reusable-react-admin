import { startCase } from 'lodash';

export const pascalCase = (string: string) => {
  return startCase(string).replace(/ /g, '');
};

const convertFileToBase64 = (file: File) => {
  return new Promise<string | ArrayBuffer | null>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const convertFilePropertiesToBase64 = async (data: any) => {
  const promises = Object.keys(data)
    .filter((key) => data[key]?.rawFile instanceof File)
    .map(async (key) => ({
      key,
      title: data[key].title,
      base64: await convertFileToBase64(data[key].rawFile),
    }));
  const base64Files = await Promise.all(promises);
  return Object.assign(
    {},
    data,
    ...base64Files.map(({ key, title, base64 }) => ({
      [key]: { title, base64 },
    })),
  );
};
