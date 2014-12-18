"use strict";

module.exports = function(sequelize, DataTypes) {
  var movies = sequelize.define("movies", {
    title: DataTypes.STRING,
    imdbID: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
       this.belongsTo(models.users);
      }
    }
  });

  return movies;
};
