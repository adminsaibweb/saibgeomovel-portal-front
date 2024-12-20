import React from 'react';

import { Container } from './styles';

export function Dialog({ children, open, closeDialog, title }) {
  return (
    <Container className="" show={open}>
      <div className="content">
        <div className="item-1">
          <h2>{title}</h2>
        </div>
        <div className="children">{children}</div>
        <div className="button-dialog">
          <button className="saib-button is-primary" onClick={() => closeDialog(false)}>
            Fechar
          </button>
        </div>
      </div>
    </Container>
  );
}
