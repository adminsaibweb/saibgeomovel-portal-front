import styled from 'styled-components';

export const TituloJanela = styled.div`
  background-color: #bd207b;
  color: white;
  margin-top: 0px;
  padding-left: 10px;
  padding-right: 10px;
  margin-left: -10px;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-grow: 1;
  div {
    flex-grow: 2;
    display: flex;
    align-items: baseline;
    a {
      i {
        color: white;
      }
    }
  }
  button.is-call-to-action {
    display: flex;
    align-items: center;
    a {
      color: white;
      align-items: center;
      display: flex;
    }
  }
  @media (max-width: 575px) {
    flex-direction: column;
    align-items: baseline;
    padding-bottom: 10px;

    h5 {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding-bottom: 3px;
    }
  }
`;
