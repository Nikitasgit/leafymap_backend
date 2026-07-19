export interface UserAddressProps {
  number?: string;
  street: string;
  code: string;
  extra?: string;
}

export type UserAddress = UserAddressProps & {
  readonly __brand: "UserAddress";
};

export const UserAddress = {
  from(props: UserAddressProps): UserAddress {
    return {
      number: props.number,
      street: props.street,
      code: props.code,
      extra: props.extra,
    } as UserAddress;
  },
};
