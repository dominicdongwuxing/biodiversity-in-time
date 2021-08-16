import React, { useEffect, useState } from "react";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <div>
      <header className={styles.header}>
        <h1>This is header.</h1>
      </header>
    </div>
  );
}
