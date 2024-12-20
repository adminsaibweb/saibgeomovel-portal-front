import React, { Component } from 'react';
import { capitalize } from '../../../../services/funcoes';
import CounterAgroupedPerProfessional from '../CounterAgroupedPerProfessional';
import { Container, Header } from './styled';

export default class CardItemOfDay extends Component {
  render() {
    const { data } = this.props;
    return (
      <Container>
        <Header>
          <p> {capitalize(data.USR_NOME, true)}</p>
          <p>Tot. agendamentos: {data.CLIENTES.length}</p>
        </Header>

        <CounterAgroupedPerProfessional data={data} month={false} />
      </Container>
    );
  }
}
