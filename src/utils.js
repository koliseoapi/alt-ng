// return true if the argument is a function
export function isFunction(t) {
  return (typeof t)[0] === 'f'
}

// return true if the argument is a Promise
export function isPromise(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

// return true if the argument is a mutable object
export function isMutableObject(target) {
  const Ctor = target.constructor

  return (
    !!target
    &&
    Object.prototype.toString.call(target) === '[object Object]'
    &&
    isFunction(Ctor)
    &&
    !Object.isFrozen(target)
    &&
    Ctor instanceof Ctor
  )
}

