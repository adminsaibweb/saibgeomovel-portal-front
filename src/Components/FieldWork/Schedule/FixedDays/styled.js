import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  border: 1px solid #7e3a9d;
  padding: 5px;
  width: max-content;
  height: max-content;
  border-radius: 5px;
`;

export const ContentDay = styled.div`
  padding: 0 3px;
  margin: 0 2px;
  width: 20px;
  display: flex;
  justify-content: center;

  border: 1px solid #7e3a9d;
  border-radius: 5px;
  color: #7e3a9d;

  cursor: pointer;

  background: ${(props) => (props.selected ? '#7e3a9d' : 'unset')};
  color: ${(props) => (props.selected ? '#fff' : 'unset')};
`;
