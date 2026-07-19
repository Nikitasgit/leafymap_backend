export interface UserPreferencesProps {
  emailNotifications?: boolean;
}

export type UserPreferences = UserPreferencesProps & {
  readonly __brand: "UserPreferences";
};

export const UserPreferences = {
  from(props: UserPreferencesProps = {}): UserPreferences {
    return {
      emailNotifications: props.emailNotifications ?? false,
    } as UserPreferences;
  },
};
