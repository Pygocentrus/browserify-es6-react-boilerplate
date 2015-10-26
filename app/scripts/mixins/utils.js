let BackboneMixin = {

  componentDidMount: function() {
    this._boundForceUpdate = this.forceUpdate.bind(this, null);
    this.getResource().on('all', this._boundForceUpdate, this);
  },

  componentWillUnmount: function() {
    this.getResource().off('all', this._boundForceUpdate);
  }
};

export default BackboneMixin;
