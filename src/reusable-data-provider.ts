import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';
import {
  IntrospectionNonNullTypeRef,
  IntrospectionObjectType,
  IntrospectionQuery,
} from 'graphql';
import { camelCase } from 'lodash';
import { singular } from 'pluralize';
import {
  CreateParams,
  CreateResult,
  DeleteManyParams,
  DeleteManyResult,
  DeleteParams,
  DeleteResult,
  GetListParams,
  GetListResult,
  GetManyParams,
  GetManyReferenceParams,
  GetManyReferenceResult,
  GetManyResult,
  GetOneParams,
  GetOneResult,
  UpdateManyParams,
  UpdateManyResult,
  UpdateParams,
  UpdateResult,
} from 'ra-core';
import { DataProvider } from 'react-admin';
import { client } from './client';
import { pascalCase } from './utils';

export class ReusableDataProvider implements DataProvider {
  private constructor(
    private readonly client: ApolloClient<NormalizedCacheObject>,
    private readonly fields: Map<string, string[]>,
  ) {}

  static async create() {
    const { data } = await client.query<IntrospectionQuery>({
      query: gql`
        query {
          __schema {
            types {
              name
              kind
              fields {
                name
                type {
                  ofType {
                    kind
                  }
                }
              }
            }
          }
        }
      `,
    });

    const fields = new Map(
      data.__schema.types
        .filter((type) => type.kind === 'OBJECT' && !type.name.startsWith('__'))
        .map((type) => [
          type.name,
          (type as IntrospectionObjectType).fields
            .filter(
              (field) =>
                (field.type as IntrospectionNonNullTypeRef).ofType?.kind ===
                'SCALAR',
            )
            .map((field) => field.name),
        ]),
    );

    return new ReusableDataProvider(client, fields);
  }

  async getList(
    resource: string,
    params: GetListParams,
  ): Promise<GetListResult<any>> {
    const queryName = camelCase(resource);
    const typeName = pascalCase(singular(resource));
    const { data } = await this.client.query({
      query: gql`query { list: ${queryName} { ${this.fields
        .get(typeName)
        ?.join(' ')} } }`,
    });
    return { data: data.list, total: data.list.length };
  }

  async getOne(
    resource: string,
    params: GetOneParams,
  ): Promise<GetOneResult<any>> {
    const queryName = camelCase(singular(resource));
    const typeName = pascalCase(singular(resource));
    const { data } = await this.client.query({
      query: gql`query($id: Int!) { one: ${queryName}(id: $id) { ${this.fields
        .get(typeName)
        ?.join(' ')} } }`,
      variables: { id: Number(params.id) },
    });
    return { data: data.one };
  }

  async getMany(
    resource: string,
    params: GetManyParams,
  ): Promise<GetManyResult<any>> {
    const queryName = `${camelCase(resource)}ByIds`;
    const typeName = pascalCase(singular(resource));
    const { data } = await this.client.query({
      query: gql`query($ids: [Int!]!) { many: ${queryName}(ids: $ids) { ${this.fields
        .get(typeName)
        ?.join(' ')} } }`,
      variables: { ids: params.ids.map((id) => Number(id)) },
    });
    return { data: data.many };
  }

  async getManyReference(
    resource: string,
    params: GetManyReferenceParams,
  ): Promise<GetManyReferenceResult<any>> {
    return {
      data: [],
      total: 0,
    };
  }

  async create(
    resource: string,
    params: CreateParams,
  ): Promise<CreateResult<any>> {
    const queryName = `create${pascalCase(singular(resource))}`;
    const typeName = pascalCase(singular(resource));
    const { data } = await this.client.mutate({
      mutation: gql`mutation($data: String!) { create: ${queryName}(data: $data) { ${this.fields
        .get(typeName)
        ?.join(' ')} } }`,
      variables: { data: JSON.stringify(params.data) },
    });
    return { data: data.create };
  }

  async update(
    resource: string,
    params: UpdateParams,
  ): Promise<UpdateResult<any>> {
    const queryName = `update${pascalCase(singular(resource))}`;
    const typeName = pascalCase(singular(resource));
    const { data } = await this.client.mutate({
      mutation: gql`mutation($id: Int!, $data: String!) { update: ${queryName}(id: $id, data: $data) { ${this.fields
        .get(typeName)
        ?.join(' ')} } }`,
      variables: { id: Number(params.id), data: JSON.stringify(params.data) },
    });
    return { data: data.update };
  }

  async updateMany(
    resource: string,
    params: UpdateManyParams,
  ): Promise<UpdateManyResult> {
    const queryName = `update${pascalCase(resource)}ByIds`;
    const { data } = await this.client.mutate({
      mutation: gql`mutation($ids: [Int!]!, $data: String!) { update: ${queryName}(ids: $ids, data: $data) }`,
      variables: {
        ids: params.ids.map((id) => Number(id)),
        data: JSON.stringify(params.data),
      },
    });
    return { data: data.update };
  }

  async delete(
    resource: string,
    params: DeleteParams,
  ): Promise<DeleteResult<any>> {
    const queryName = `delete${pascalCase(singular(resource))}`;
    const typeName = pascalCase(singular(resource));
    const { data } = await this.client.mutate({
      mutation: gql`mutation($id: Int!) { delete: ${queryName}(id: $id) }`,
      variables: { id: Number(params.id) },
    });
    return { data: data.delete };
  }

  async deleteMany(
    resource: string,
    params: DeleteManyParams,
  ): Promise<DeleteManyResult> {
    const queryName = `delete${pascalCase(resource)}ByIds`;
    const { data } = await this.client.mutate({
      mutation: gql`mutation($ids: [Int!]!) { delete: ${queryName}(ids: $ids) }`,
      variables: { ids: params.ids.map((id) => Number(id)) },
    });
    return { data: data.delete };
  }
}
