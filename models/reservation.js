/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");


/** A reservation for a party */

class Reservation {
  constructor({id, customerId, numGuests, startAt, notes}) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }
  //* set the number of guest  */
  set numGuests(val) {
    if(val<1) throw new Error("Cannot have fewer than 1 guest.");
    this._numGuest=val;
  }
  /* get the number of guest */
  get numGuests(){
    return this._numGuest;
  }
 /*set date */
  set startAt(val){
    if(val instanceof Date && !isNaN(val))
    this._startAt=val;
    else throw new Error("Not a valid startAt");
    
  }
  /**get date */
  get startAt() {
    return this._startAt;
  }

  /** formatter for startAt */

  getformattedStartAt() {
    return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
  }
  /**set notes */
  set notes(val){
    this._notes = val;
  }
/**get notes */
  get notes(){
    return this._notes;
  }

  set customerId(val) {
    if(this._customerId && this._customerId !== val)
      throw new Error ("Cannot change customer id");
    this._customerId = val;
  }

  get customerId(){
    return this._customerId;
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
          `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
        [customerId]
    );

    return results.rows.map(row => new Reservation(row));
  }

  /** save this reservation */
  async save(){
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO reservations (start_at, num_guests, notes, customer_id)
        VALUES ($1,$2,$3,$4)
        RETURNING id`,
        [this.startAt, this.numGuests, this.notes, this.customerId]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(`UDPATE reservations SET start_at=$1, num_guests=$2, notes=$3, customer_id=$4
      WHERE id = $5`,
      [this.startAt, this,numGuests, this.notes, this.customerId]
      );
    }
  }
}

module.exports = Reservation;
