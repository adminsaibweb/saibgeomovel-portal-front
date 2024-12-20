import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-wrap: ${(props) => (props.isMobile ? 'none' : 'wrap')};
  flex-direction: ${(props) => (props.isMobile ? 'column' : 'row')};
  align-items: center;
  width: 100%;
  padding: 10px;
  gap: 10px;
  box-shadow: -1px 1px 5px 1px rgb(0 0 0 / 10%);

  button.update {
    height: ${(props) => (props.isMobile ? '3.5rem' : '3rem')};
  }

  ul.collapsible {
    padding: 5px 10px !important;
  }

  .collapsible-header {
    font-size: 1rem !important;
    font-weight: 500 !important;
  }
`;

export const Linha = styled.div`
  display: flex;
  width: 100%;
  gap: 10px;
`;

export const LabelUpdate = styled.div`
  display: flex;
  margin-left: 5px;

  @media (max-width: 476px) {
    display: none;
  }
`;

export const DivFinal = styled.div`
  display: flex;
  flex-grow: 1;
  gap: 10px;

  @media (max-width: 420px) {
    width: 100%;
  }
`;

export const DivDetalhe = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  text-align: left;
  width: ${(props) => (props.width ? props.width : 'unset')};

  table.findSchedule {
    thead tr th {
      padding: 15px 10px !important;
    }
  }

  select {
    display: block !important;
  }
  select.selectTypeEmployee {
    border-radius: 5px;
  }
  .searchButton {
    text-transform: capitalize !important;
    border-radius: ${(props) => props.isMobile && '100px !important'};
    width: ${(props) => (props.isMobile ? '100% !important' : '18px !important')};
    height: ${(props) => props.isMobile && '2.8rem !important'};
    padding: ${(props) => (props.isMobile ? '5px !important' : '18px !important')};
    color: white;
    gap: 5px;
  }

  div.react-datepicker-wrapper {
    margin: 0px !important;
  }
  a {
    height: 2.8rem !important;
    width: 100%;
  }
`;

export const Labels = styled.label`
  font-size: ${(props) => (props.fontSize === undefined ? '1rem' : props.fontSize)};
  color: ${(props) => (props.valor === 'Não' ? '#858585' : 'red')};
  color: ${(props) => props.valor === undefined && '#858585'};
  font-weight: ${(props) => (props.fontWeight === undefined ? '500' : props.fontWeight)};
`;

export const ContentDetailsAlerts = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  div {
    line-height: 18px;
    display: flex;

    span,
    p {
      color: #fff;
    }

    span {
      font-weight: 700;
      margin-right: 10px;
    }
  }
`;

export const MapContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  width: 100%;
  height: 100%;
`;

export const ContentBodyCollapsible = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
`;
