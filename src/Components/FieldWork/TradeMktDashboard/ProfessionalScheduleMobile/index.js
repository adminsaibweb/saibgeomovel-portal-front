import React, { Component } from 'react';
import { Collapsible, CollapsibleItem, Icon } from 'react-materialize';
import ItemDataTable from './ItemDataTable';
import {
  Container,
  ContentData,
  ContentBodyCollapsible,
  ContentHeader,
  PTitle,
  ContentItemsBody,
  PDescriptionItem,
  ContentNamesCompany,
  CorporateName,
} from './styled';

export default class ProfessionalScheduleMobile extends Component {
  state = {
    itemsClicked: [-1],
  };

  render() {
    const { data } = this.props;

    return (
      <Container>
        <ContentData>
          <ContentHeader>
            <PDescriptionItem width="10%"></PDescriptionItem>

            <PTitle width="25%">Status</PTitle>
            <PTitle width="60%">Nome</PTitle>
            <PTitle width="5%"></PTitle>
          </ContentHeader>

          {data &&
            data.map((schedule, i) => (
              <Collapsible
                key={i}
                accordion
                style={{
                  width: '100%',
                  borderStyle: 'none',
                  boxShadow: 'none',
                }}
                options={{
                  onOpenStart: () => {
                    this.setState((prevState) => ({
                      itemsClicked: [...prevState.itemsClicked, i],
                    }));
                  },
                  onCloseStart: () => {
                    const { itemsClicked } = this.state;
                    this.setState({
                      itemsClicked: itemsClicked.filter((item) => item !== i),
                    });
                  },
                }}
              >
                <CollapsibleItem
                  expanded={false}
                  className="collapsibleItemDashboard"
                  header={
                    <ContentItemsBody clicked={this.state.itemsClicked?.includes(i)}>
                      <PDescriptionItem width="10%">
                        <span
                          style={{
                            fontSize: '1rem',
                            display: 'flex',
                            color:
                              schedule.status === 'Atendendo'
                                ? '#8E44AD'
                                : schedule.status === 'Atendido'
                                ? '#27ae60'
                                : schedule.status === 'Justificado'
                                ? '#16a085'
                                : '#2c3e50',
                          }}
                        >
                          {schedule.status === 'Atendendo' && <Icon>pending</Icon>}
                          {schedule.status === 'Atendido' && <Icon>check_circle</Icon>}
                          {schedule.status === 'Justificado' && <Icon>check_circle_outline</Icon>}
                          {schedule.status === 'Não atendido' && <Icon>hourglass_full</Icon>}
                        </span>
                      </PDescriptionItem>
                      <PDescriptionItem width="25%">{schedule.status}</PDescriptionItem>

                      <ContentNamesCompany width="60%">
                        <PDescriptionItem>{schedule.CLI_NOME_FANTASIA}</PDescriptionItem>
                        <CorporateName>({schedule.CLI_RAZAO_SOCIAL})</CorporateName>
                      </ContentNamesCompany>
                      <PDescriptionItem width="5%">
                        <>
                          <Icon className="material-icons plus">add_circle_outline</Icon>

                          <Icon href="#" className="material-icons minus">
                            remove_circle_outline
                          </Icon>
                        </>
                      </PDescriptionItem>
                    </ContentItemsBody>
                  }
                  node="div"
                >
                  <ContentBodyCollapsible>
                    <ItemDataTable
                      data={schedule}
                      statePrevius={this.props.statePrevius}
                      lineClicked={this.props.lineClicked}
                      makeWindowRoute={this.props.makeWindowRoute}
                    />
                  </ContentBodyCollapsible>
                </CollapsibleItem>
              </Collapsible>
            ))}
        </ContentData>
      </Container>
    );
  }
}
