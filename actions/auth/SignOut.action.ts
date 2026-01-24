export interface ISignOutAction {
  execute(): Promise<void>;
}

class SignOutAction implements ISignOutAction {
  execute(): Promise<void> {
    // No action needed, controller will clear cookies
    return Promise.resolve();
  }
}

export default SignOutAction;
