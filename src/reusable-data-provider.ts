import {
  ApolloClient,
  gql,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';
import {
  IntrospectionNonNullTypeRef,
  IntrospectionObjectType,
  IntrospectionQuery,
} from 'graphql';
import { camelCase, startCase } from 'lodash';
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
                (field.type as IntrospectionNonNullTypeRef).ofType.kind ===
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
    const typeName = startCase(singular(resource));
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
    const queryName = singular(resource);
    const typeName = startCase(singular(resource));
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
    const queryName = camelCase(resource);
    const typeName = startCase(singular(resource));
    const { data } = await this.client.query({
      query: gql`query($id: [Int!]!) { many: ${queryName}(ids: $ids) { ${this.fields
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

  async update(
    resource: string,
    params: UpdateParams,
  ): Promise<UpdateResult<any>> {
    return { data: { id: 1 } };
  }

  async updateMany(
    resource: string,
    params: UpdateManyParams,
  ): Promise<UpdateManyResult> {
    return { data: [] };
  }

  async create(
    resource: string,
    params: CreateParams,
  ): Promise<CreateResult<any>> {
    return { data: { id: 1 } };
  }

  async delete(
    resource: string,
    params: DeleteParams,
  ): Promise<DeleteResult<any>> {
    return { data: { id: 1 } };
  }

  async deleteMany(
    resource: string,
    params: DeleteManyParams,
  ): Promise<DeleteManyResult> {
    return { data: [] };
  }
}
