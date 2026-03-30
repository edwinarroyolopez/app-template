export type FilterOption<T extends string> = {
  value: T;
  label: string;
  icon: React.ComponentType<any>;
};
