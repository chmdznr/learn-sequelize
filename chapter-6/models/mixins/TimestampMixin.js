const TimestampMixin = {
  addTimestamps(Model) {
    Model.addHook('beforeCreate', (instance) => {
      instance.createdAt = new Date();
      instance.updatedAt = new Date();
    });

    Model.addHook('beforeUpdate', (instance) => {
      instance.updatedAt = new Date();
    });

    return Model;
  }
};

module.exports = TimestampMixin;
