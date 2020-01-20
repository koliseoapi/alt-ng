/**
 * Will pass the state of a store as properties to the nested components.
 * If there is more than one store, the stores themselves will be passed
 */
import React from "react";
import PropTypes from "prop-types";

export default class AltContainer extends React.Component {
  constructor(props) {
    super(props);
    const { store, stores } = props;

    if (process.env.NODE_ENV !== "production") {
      if (!stores && !store) {
        throw new Error("Must define either store or stores");
      }
      if (stores && store) {
        throw new Error("Cannot define both store and stores");
      }
    }
    this.onStoreChange = this.onStoreChange.bind(this);
    this.state = this._reduceState();
    this.storeListeners = [];
  }

  /*
  TODO: maybe use componentDidUpdate instead (is this really necessary?)
  componentWillReceiveProps(nextProps) {
    // todo: compare with the current properties, maybe we don't need to do anything
    this._destroySubscriptions();
    this.setState(this._reduceState(nextProps));
    this._registerStores(nextProps);
  }
  */

  componentDidMount() {
    this._registerStores(this.props);
  }

  componentWillUnmount() {
    this._destroySubscriptions();
  }

  _reduceState() {
    const { store, stores, mergeFunc } = this.props;
    return store ? store.getState() : mergeFunc(stores);
  }

  _registerStores({ store, stores }) {
    stores = stores || [store];
    stores.forEach(this._addSubscription.bind(this));
  }

  _destroySubscriptions() {
    this.storeListeners.forEach(storeListener => storeListener.dispose());
    this.storeListeners = [];
  }

  _addSubscription(store) {
    this.storeListeners.push(store.subscribe(this.onStoreChange));
  }

  onStoreChange() {
    this.setState(this._reduceState(this.props));
  }

  render() {
    const {
      element,
      children,
      store,
      stores,
      mergeFunc,
      ...nodeProps
    } = this.props;
    return React.createElement(
      element,
      nodeProps,
      React.Children.map(children, child => {
        const childrenProps = Object.assign({}, this.state, child.props);
        return React.cloneElement(child, childrenProps);
      })
    );
  }
}

const storeShape = PropTypes.shape({
  getState: PropTypes.func.isRequired
});
AltContainer.propTypes = {
  // specify either store (a single store) or stores (array of stores)
  store: storeShape,
  stores: PropTypes.arrayOf(storeShape),

  // when specifying multiple stores, this is the function that will be called to merge the states of all stores.
  // By default, Object.assign() will be invoked with all the states.
  mergeFunc: PropTypes.func,

  // when rendering multiple children, a parent element will be created. Default is "div"
  element: PropTypes.string
};

AltContainer.defaultProps = {
  element: "div",
  mergeFunc: function(stores) {
    return stores.reduce(function(state, store) {
      return Object.assign(state, store.getState());
    }, {});
  }
};
