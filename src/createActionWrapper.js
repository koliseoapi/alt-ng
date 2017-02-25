import { isPromise, isFunction } from './utils'

export default function createActionWrapper(dispatcher, type, actionFunction) {

  // wrap the payload and metadata into a FSA and send to dispatcher
  const wrapAndDispatch = (payload, { error, loading } = {}) => {
    const action = { type, payload };
    if (error) {
      action.error = error;
    }
    if (loading) {
      action.meta = { loading };
    }
    dispatcher.dispatch(action)
  }

  const actionWrapper = (...args) => {
    const payload = actionFunction(...args)
    if (isPromise(payload)) {
      wrapAndDispatch(null, { loading: true });
      return payload.then(function (result) {
        wrapAndDispatch(result);
        return result;
      }).catch(function (error) {
        wrapAndDispatch(null, { error });
        throw error;
      })

    } else if (isFunction(payload)) {
      return payload(wrapAndDispatch, this)
    } else if (payload !== undefined) {
      wrapAndDispatch(payload)
    }
    return payload
  }
  actionWrapper.type = type;
  return actionWrapper;

}
