import styled from 'styled-components';

export const Container = styled.div`
  /* margin-top: 5px; */
  padding: 0 5px;

  div.contentClients {
    display: flex;
    flex-wrap: wrap;
  }
`;
export const LabelStatus = styled.p`
  font-weight: 500;
  color: ${(props) => props.color};
`;
export const LabelClient = styled.p`
  font-weight: 500;
  color: #858585;
  padding-right: 5px;
  white-space: nowrap;
  label {
    font-weight: bolder;
    color: #000;
  }
`;
