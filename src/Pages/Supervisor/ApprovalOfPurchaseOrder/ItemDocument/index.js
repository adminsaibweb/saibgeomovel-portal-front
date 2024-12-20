import React, { Component } from "react"
import { currencyFormat } from "../../../../services/funcoes"
import { Icon } from 'react-materialize';

import { Container, Details, ContentCenter, ColumnLeft, ColumnRight, Actions, ActionsWaitApproved } from "./styles"

class ItemDocument extends Component {
  state = {
    openModal: false,
  }
  render() {
    const { type, provider, dataOrder, dataPrediction, numberDoc, value, status, observation } = this.props
    return (
      <Container>
        <Details>
          <div>
            <h5>Fornecedor</h5>
            <span>{provider}</span>
          </div>
          <div>
            <h5>Número do pedido</h5>
            <span>{numberDoc}</span>
          </div>
          <ContentCenter>
            <ColumnLeft>
              <div>
                <h5>Tipo</h5>
                <span>{type}</span>
              </div>
              <div>
                <h5>Data da ordem</h5>
                <span>{dataOrder}</span>
              </div>
            </ColumnLeft>

            <ColumnRight>
              <div>
                <h5>Valor da ordem</h5>
                <span className="value">{currencyFormat(value)}</span>
              </div>
              <div>
                <h5>Previsão de entrega</h5>
                <span>{dataPrediction}</span>
              </div>
            </ColumnRight>
          </ContentCenter>
          {observation && (
            <div>
              <h5>Observações gerais</h5>
              <span>{observation}</span>
            </div>
          )}
        </Details>        
          {status !== -1 ? <Actions>
            <button title="Voltar para aprovação" onClick={() => this.props.setOpenModal(true, 0)}><Icon>arrow_back</Icon>Voltar</button>
            <button title="Ver documento" onClick={() => this.props.setOpenModal(true, 1)}><Icon>search</Icon>Ver</button>
          </Actions> :
            <ActionsWaitApproved>
              <button title="Negar" onClick={() => this.props.setOpenModal(true, 1)}><Icon>block</Icon>Negar</button>
              <button title="Ver documento" onClick={() => this.props.setOpenModal(true, 1)}><Icon>search</Icon>Ver</button>
              <button title="Aprovar" onClick={() => this.props.setOpenModal(true, 1)}><Icon>done</Icon>Aprovar</button>
            </ActionsWaitApproved>
          }
      </Container>
    )
  }
}

export default ItemDocument;