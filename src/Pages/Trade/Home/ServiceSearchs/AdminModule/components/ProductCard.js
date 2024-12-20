import React from 'react';
import './forced.css';
import { formatOracleDateToBr } from '../../../../../../services/funcoes';

export class ProductCard extends React.Component {
  render() {
    const { data } = this.props;

    const {
      PROD_DESCR,
      LOTE,
      DATA_VALIDADE,
      SERIE,
      QTDE_LIDO,
      QTDE,
      DATA_FABRICACAO,
      DATA_ALTERACAO,
      PROD_CODIGO
    } = data;

    return (
      <div className="card" style={{ padding: '4px 6px', fontSize: '16px' }}>
        <p>
          <strong>Produto:</strong> {PROD_DESCR}
        </p>
        <p>
          <strong>Código:</strong> {PROD_CODIGO}
        </p>
        <p>
          <strong>Quantidade lida:</strong> {QTDE_LIDO}
        </p>
        <p>
          <strong>Quantidade consignada:</strong> {QTDE}
        </p>
        <p>
          <strong>Lote: </strong> {LOTE}
        </p>
        <p>
          <strong>Série: </strong> {SERIE}
        </p>
        {DATA_FABRICACAO && (
          <p>
            <strong>Data fabricação: </strong> {formatOracleDateToBr(DATA_FABRICACAO)}
          </p>
        )}
        <p>
          <strong>Data validade: </strong> {formatOracleDateToBr(DATA_VALIDADE)}
        </p>
        {DATA_ALTERACAO && <p>
          <strong>Data última alteração: </strong> {formatOracleDateToBr(DATA_ALTERACAO)}
        </p>}
      </div>
    );
  }
}
