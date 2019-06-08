// Copyright (c) 2018-2019, The TurtleCoin Developers
//
// Please see the included LICENSE file for more information.

'use strict'

const varint = require('varint')

/* This interface allows for easier reading of a Buffer (blob)
   without manually keeping track of where we are at in the Buffer */
const Reader = function (blob) {
  if (!(this instanceof Reader)) return new Reader(blob)
  this.blob = blob
  this.currentOffset = 0

  Object.defineProperty(this, 'unreadBytes', {
    get: function () {
      return this.blob.length - this.currentOffset
    }
  })

  Object.defineProperty(this, 'EOS', {
    get: function () {
      return (this.unreadBytes === 0)
    }
  })
}

/* Reads the next varint encoded value from the Buffer */
Reader.prototype.nextVarint = function () {
  const start = this.currentOffset
  do {
    /* Check to see if the MSB not set and if it's not
       then we have reached the end of our varint */
    if (this.blob.readUInt8(this.currentOffset) < 128) {
      this.currentOffset++
      return varint.decode(this.blob.slice(start, this.currentOffset))
    }
    this.currentOffset++
  } while (true)
}

/* Reads the next hash value from the buffer */
Reader.prototype.nextHash = function () {
  const start = this.currentOffset
  this.currentOffset += 32
  return this.blob.slice(start, this.currentOffset).toString('hex')
}

/* Reads the next uint32 from the buffer */
Reader.prototype.nextUInt32 = function () {
  const start = this.currentOffset
  this.currentOffset += 4
  return this.blob.readUInt32BE(start)
}

/* Reads the next byte(s) from the Buffer and returns a Buffer */
Reader.prototype.nextBytes = function (count) {
  count = count || 1
  const start = this.currentOffset
  this.currentOffset += count
  return this.blob.slice(start, this.currentOffset)
}

/* Skips the specified number of bytes in the Buffer */
Reader.prototype.skip = function (count) {
  count = count || 1
  this.currentOffset += count
}

module.exports = Reader