import React from 'react';
import './forced.css';
import { formatOracleDateToBr } from '../../../../../../services/funcoes';

export class ProductList extends React.Component {
  render() {
    const { data, conf } = this.props;

    const { LOTE, DATA_VALIDADE, SERIE, QTDE, QTDE_UTILIZADA, DATA_FABRICACAO, DATA_ALTERACAO } = data;

    return (
      <div className="card" style={{ padding: '4px 6px', fontSize: '16px', borderRadius: '5px' }}>
        {conf && (
          <>
            <p>
              <strong>Quantidade lido:</strong> {conf.QTDE_LIDO}
            </p>
            <p>
              <strong>Consignado: </strong> {conf.QTDE}
            </p>

            <p>
              <strong>Diferença: </strong> {conf.QTDE - conf.QTDE_LIDO}
            </p>
          </>
        )}
        {!conf && (
          <>
            <p>
              <strong>Quantidade total:</strong> {QTDE}
            </p>
            <p>
              <strong>Utilizado: </strong> {QTDE_UTILIZADA}
            </p>

            <p>
              <strong>Quantidade em estoque: </strong> {QTDE - QTDE_UTILIZADA}
            </p>
          </>
        )}
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
