import { gql } from '@apollo/client';
import { AuthProvider } from 'react-admin';
import { client } from './client';

export const reusableAuthProvider: AuthProvider = {
  async login({ username: email, password }) {
    const { data } = await client.mutate({
      mutation: gql`
        mutation Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            token
          }
        }
      `,
      variables: { email, password },
    });
    localStorage.setItem('token', data.login.token);
  },

  async logout() {
    localStorage.removeItem('token');
  },

  async checkError({ status }) {
    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      return Promise.reject();
    }
    return Promise.resolve();
  },

  async checkAuth(error: any) {
    return localStorage.getItem('token') ? Promise.resolve() : Promise.reject();
  },

  async getPermissions(params: any) {},
};
