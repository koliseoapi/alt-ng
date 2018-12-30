import { isPromise, isFunction } from "./utils";

export default function createActionWrapper(dispatcher, type, actionFunction) {
  function actionWrapper(...args) {
    actionWrapper._dispatchReturn = true;
    const payload = actionFunction.call(actionWrapper, ...args);
    if (actionWrapper._dispatchReturn) {
      if (isPromise(payload)) {
        return payload.then(function(result) {
          actionWrapper._dispatchReturn &&
            actionWrapper.dispatch({ payload: result });
          return result;
        });
      } else if (isFunction(payload)) {
        return payload.call(actionWrapper);
      } else {
        actionWrapper.dispatch({ payload });
      }
    }
    return payload;
  }

  // make this.dispatch and this.dispatchAction available in the action method
  Object.assign(actionWrapper, {
    type,

    // wrap the payload and metadata into a FSA and send to dispatcher
    // @param action is a Flux Standard Action { type: string, payload: Object (optional), error: boolean (optional), meta: Object (optional) }
    // if not providde, type will default to the type of this action
    dispatch(action) {
      action.type = action.type || this.type;
      dispatcher.dispatch(action);
    },

    preventDefault() {
      this._dispatchReturn = false;
    }
  });
  return actionWrapper;
}
