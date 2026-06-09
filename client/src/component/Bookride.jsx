import React from "react";
export default function Bookride() {
  return (
    <div>
      <label htmlFor="seat" placeholder="if you have some along with you">Number of person you want to book</label>
      <input id="seat" type="number" min="1" value="1"/>
    </div>
  );
}
