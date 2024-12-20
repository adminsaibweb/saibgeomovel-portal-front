import styled from 'styled-components';

export const DivDetalhe = styled.div`
  display: flex;
  flex-direction: column;
  /* padding: 0px 10px 0px 10px; */
  text-align: left;
  width: 45%;
  line-height: 0.9rem;
  flex: ${(props) => (props.flex === undefined ? 'unset' : props.flex)};
  span {
    cursor: ${(props) => (props.isDisabled ? 'default' : 'pointer')};
  }

  @media (max-width: 768px) {
    /* padding-top: 0px; */
    width: 100%;
    button {
      width: 100%;
    }
  }
  div > .input-field.col {
    margin-top: 0px !important;
  }
  select {
    display: block !important;
  }
  button {
    margin: 2px;
    /* margin-bottom: 10px !important; */
  }
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

export const InputsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
  }
`;

export const Labels = styled.label`
  font-size: ${(props) => (props.fontSize === undefined ? '1rem' : props.fontSize)};
  color: ${(props) => (props.valor === 'Não' ? '#858585' : 'red')};
  color: ${(props) => props.valor === undefined && '#858585'};
  font-weight: ${(props) => (props.fontWeight === undefined ? '500' : props.fontWeight)};
`;
