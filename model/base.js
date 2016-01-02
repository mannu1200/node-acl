"use strict";

var util = require("util");

function Base(table) {
    this.table = table;
};

/*
 * @param {Object} data - data to insert
 */
Base.prototype.insert = function(data, cb) {
    var table = this.table;
    table.insert(data).exec(cb);
}

Base.prototype.update = function(data, id, cb) {
    var table = this.table;
    table.where({
        id: id
    }).update(data).exec(cb);
}

/*
 * @param {Array} columns - Array of string of column to be selected
 * @param {Object} conditions - for where condition (sample = {user_id:100})
 */
Base.prototype.select = function(opts, cb) {
    var table = this.table,
        filters = [],
        columns = opts.columns,
        conditions = opts.conditions || [],
        selects = null;


    selects = table.star();
    if (columns && util.isArray(columns)) {
        selects = columns;
    }

    Object.keys(conditions).forEach(function(k) {
        filters.push(table[k].equals(conditions[k]));
    });

    if (!filters.length) {
        return cb("Conditions required!");
    }
    table.select(selects).where.apply(table, filters).exec(cb);
}

/*
 * @param {Object} conditions - for where conditions
 */
Base.prototype.remove = function(conditions, cb) {
    var table = this.table,
        filters = [];

    Object.keys(conditions).forEach(function(k) {
        filters.push(table[k].equals(conditions[k]));
    });

    if (!filters.length) {
        return cb("Conditions required");
    }
    table.delete().where.apply(table, filters).exec(cb);
}


module.exports = Base;