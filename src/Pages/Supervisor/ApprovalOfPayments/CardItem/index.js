import React, { Component } from "react"
import { Icon } from 'react-materialize';
import { currencyFormat } from "../../../../services/funcoes";
import { Container, Details, ColumnLeft, ColumnRight, Actions, ActionsWaitApproved } from "./styles"

class CardItem extends Component {
  state = {
    openModal: false,
  }
  render() {
    const { nameBank, typeDocument, paymentForm, userName, nrCheque, nrDocument, dateCredit, valueTotal, valuePartially, status } = this.props
    return (
      <Container>
        <Details>
          <ColumnLeft>
            <div>
              <h5>Tipo</h5>
              <span>{typeDocument} Nº {nrDocument}</span>
            </div>
            <div>
              <h5>Forma de pagamento</h5>
              <span>{paymentForm}</span>
            </div>
            <div>
              <h5>Nome</h5>
              <span className="name">{userName}</span>
            </div>
            <div>
              <h5>Nr documento</h5>
              <span>{nrCheque}</span>
            </div>
          </ColumnLeft>

          <ColumnRight>
            <div>
              <h5>Banco</h5>
              <span>{nameBank}</span>
            </div>
            <div>
              <h5>Data de crédito</h5>
              <span>{dateCredit}</span>
            </div>
            <div>
              <h5>Usuário</h5>
              <span className="name">{userName}</span>
            </div>
          </ColumnRight>
        </Details>
        <span>Valor total: <strong>{currencyFormat(valueTotal)}</strong></span>
        {valuePartially && valueTotal !== valuePartially && <span className="partiallyPay">Valor parcialmente aprovado: <strong>{currencyFormat(valuePartially)}</strong></span>}
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

export default CardItem;