export type Merge<M, N> = Omit<M, keyof N> & N;
