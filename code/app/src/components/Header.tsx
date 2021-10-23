import React, { useEffect, useState } from "react";
import styles from "./Header.module.css";
import { Container } from "@mui/material"

export default function Header() {
  return (
    <div>
      <header className={styles.header}>
        <h1>Prototype for biodiversity through time visualization</h1>
      </header>
    </div>
  );
}
