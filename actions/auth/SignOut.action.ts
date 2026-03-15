export interface ISignOutAction {
  execute(): Promise<void>;
}

class SignOutAction implements ISignOutAction {
  execute = async (): Promise<void> => {};
}

export default SignOutAction;
