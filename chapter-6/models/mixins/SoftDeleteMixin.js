const SoftDeleteMixin = {
  addSoftDelete(Model) {
    Model.addHook('beforeFind', (options) => {
      if (!options.withDeleted) {
        options.where = {
          ...options.where,
          deletedAt: null
        };
      }
    });

    Model.prototype.softDelete = async function() {
      this.deletedAt = new Date();
      await this.save();
    };

    Model.prototype.restore = async function() {
      this.deletedAt = null;
      await this.save();
    };

    Model.withDeleted = function(options = {}) {
      return this.findAll({
        ...options,
        withDeleted: true
      });
    };

    return Model;
  }
};

module.exports = SoftDeleteMixin;
