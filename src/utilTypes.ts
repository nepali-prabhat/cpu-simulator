export type Merge<M, N> = Omit<M, keyof N> & N;

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
