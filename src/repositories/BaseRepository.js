class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  getAll() {
    return this.model.find();
  }

  getById(id) {
    return this.model.findById(id);
  }

  async create(body) {
    // eslint-disable-next-line new-cap
    const data = new this.model(body);
    await data.save();
    return data;
  }

  update(id, body) {
    return this.model.findByIdAndUpdate({ _id: id }, body, { new: true });
  }

  deleteById(id) {
    return this.model.findByIdAndRemove(id);
  }
}

module.exports = BaseRepository;
