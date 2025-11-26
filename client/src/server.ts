import bootstrap from './main.server';

export default {
  async render(url: string, context: any) {
    return bootstrap(context);
  }
};
