import React, { Component } from 'react';
import { Button, Icon } from 'react-materialize';
import { Link } from 'react-router-dom';
import { currencyFormat } from '../../../../../services/funcoes';
import Question from '../../../../Globals/Question';
import { Container, Item, PTitle, PData, Row } from './styled';

export default class ItemDataTable extends Component {
  render() {
    const { data } = this.props;

    return (
      <Container>
        <Row>
          <Item>
            <PTitle>Ínicio</PTitle>

            <PData>{data?.CHECKIN ? data.CHECKIN : '##:##'}</PData>
          </Item>
          <Item>
            <PTitle>Fim</PTitle>

            <PData>{data.CHECKOUT ? data.CHECKOUT : '##:##'}</PData>
          </Item>
          <Item align="flex-start">
            <PTitle>Tempo</PTitle>

            <PData>{data.WORK_TIME ? data.WORK_TIME : '##:##'}</PData>
          </Item>
        </Row>
        <Row>
          <Item align="center">
            <PTitle>Pesquisas</PTitle>

            <PData>{data.TOTAL_PESQUISAS}</PData>
          </Item>
          <Item align="center">
            <PTitle>Perguntas</PTitle>

            <PData>{data.TOTAL_PERGUNTAS}</PData>
          </Item>
          <Item align="center">
            <PTitle>Respostas</PTitle>

            <PData>
              {data.TOTAL_PERGUNTAS_RESPONDIDAS} [{currencyFormat(data.PERCENTUAL_RESPONDIDO, '', 2) + '%'}]
            </PData>
          </Item>
        </Row>

        <Row withMargins>
          {data.havePhoto && (
            <Link
              to={{
                pathname: '/SchedulePhotos',
                state: [
                  data,
                  {
                    statePrevius: this.props.statePrevius,
                    urlPrevius: 'ProfessionalSchedule',
                    lineClicked: this.props.lineClicked,
                  },
                ],
                urlPrevius: 'ProfessionalSchedule',
                forceBack: true,
              }}
            >
              <Button className="saib-button is-primary photoButton">
                <Icon tiny>image</Icon>&nbsp; <span>Fotos</span>
              </Button>
            </Link>
          )}
          {data.TOTAL_PERGUNTAS_RESPONDIDAS > 0 && (
            <Link
              to={{
                pathname: '/ScheduleSearchs',
                state: [
                  data,
                  {
                    statePrevius: this.props.statePrevius,

                    urlPrevius: 'ProfessionalSchedule',
                    lineClicked: this.props.lineClicked,
                  },
                ],
                forceBack: true,
                statePrevius: this.props.statePrevius,
                urlPrevius: 'ProfessionalSchedule',
              }}
            >
              <Button className="saib-button is-primary usesActionButton scheduleButton">
                <Icon tiny>question_answer</Icon>&nbsp; <span>Perguntas</span>
              </Button>
            </Link>
          )}
          {data.CLI_LATITUDE && data.CLI_LONGITUDE && (
            <Button
              className="saib-button is-primary mapButton"
              onClick={() => this.props.makeWindowRoute(data.CLI_LATITUDE, data.CLI_LONGITUDE)}
            >
              <Icon tiny>map</Icon>&nbsp; <span>Mapa</span>
            </Button>
          )}

          {data.status === 'Justificado' && (
            <div style={{ marginLeft: '5px' }}>
              <Question
                iconeBotaoPadrao={<Icon tiny>help_center</Icon>}
                classeBotaoPadrao="waves-effect waves-light saib-button is-primary scheduleButton"
                textoBotaoPadrao="Justificativa"
                titulo="Atendimento justificado"
                tituloBotaoSim="Fechar"
                classeBotaoSim="waves-effect waves-light saib-button is-primary modal-action modal-close"
                tituloBotaoNao=""
                classeBotaoNao="waves-effect waves-light saib-button is-primary modal-action modal-close hidden"
                message={
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label fontWeight={600}>
                      Justificativa: <strong>{data.JUSTIFICATIVA}</strong>
                    </label>
                    <label fontWeight={600}>
                      Data/Hora: <strong>{data.STR_HORA_JUSTIFICADO}</strong>
                    </label>
                  </div>
                }
                onNo={() => {}}
                onYes={() => {}}
              />
            </div>
          )}
        </Row>
      </Container>
    );
  }
}
