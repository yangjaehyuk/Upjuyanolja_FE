import { useState } from 'react';
import { InputNumber, Col } from 'antd';
import styled from 'styled-components';
import { TextBox } from '@components/text-box';
import { FormErrorMessage } from '@components/init/FormErrorMessage';
import { ValidateInputProps, CapacityContainerProps } from './type';
import {
  MAX_CAPACITY,
  MIN_CAPACITY,
} from '@/constants/room/room-registration/';

export const CapacityContainer = ({ header }: CapacityContainerProps) => {
  const [capacityValue, setCapacityValue] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const validateInput = ({ value }: ValidateInputProps) => {
    setError(null);
    if (value < MIN_CAPACITY || value > MAX_CAPACITY) {
      setError('1~15까지만 입력 가능합니다.');
      // } else if (!NUMBER_REGEX.test(value.toString())) {
      //   setError('숫자만 입력 가능합니다.');
      // 다른 예외 처리는 내일 담당 PM분과 상의 후 처리 할 예정입니다.
    }
  };

  const handleCapacityChange = (
    newValue: number | string | null | undefined,
  ) => {
    if (typeof newValue !== 'number') return;
    validateInput({ value: newValue });
    setCapacityValue(newValue);
  };

  return (
    <StyledInputWrapper>
      <StyledHeadTextContainer>
        <TextBox typography="h4" fontWeight={700}>
          {header}
        </TextBox>
      </StyledHeadTextContainer>
      <StyledCol>
        <StyledRow>
          <StyledTextBoxWrapper>
            <TextBox typography="body1" color="black900" fontWeight="normal">
              기준 인원
            </TextBox>
          </StyledTextBoxWrapper>
          <StyledInputNumber
            min={1}
            max={15}
            defaultValue={1}
            value={capacityValue}
            onChange={handleCapacityChange}
          />
          <StyledTextBoxWrapper>
            <TextBox typography="body1" color="black900" fontWeight="normal">
              명
            </TextBox>
          </StyledTextBoxWrapper>
        </StyledRow>
        <StyledRow>
          <StyledTextBoxWrapper>
            <TextBox typography="body1" color="black900" fontWeight="normal">
              최대 인원
            </TextBox>
          </StyledTextBoxWrapper>
          <StyledInputNumber
            min={1}
            max={15}
            defaultValue={1}
            value={capacityValue}
            onChange={handleCapacityChange}
          />
          <StyledTextBoxWrapper>
            <TextBox typography="body1" color="black900" fontWeight="normal">
              명
            </TextBox>
          </StyledTextBoxWrapper>
        </StyledRow>
        {error && (
          <StyledErrorMessageWrapper data-testid="error-input-capacity">
            <StyledFormErrorMessage errorMessage={error} />
          </StyledErrorMessageWrapper>
        )}
      </StyledCol>
    </StyledInputWrapper>
  );
};

const StyledCol = styled(Col)`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StyledHeadTextContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
`;

const StyledErrorMessageWrapper = styled.div`
  height: 18px;
  width: 100%;
  position: absolute;
  bottom: -24px;
  left: 0;
`;

const StyledFormErrorMessage = styled(FormErrorMessage)`
  float: left;
  position: absolute;
  bottom: 0;
  left: 0;
`;

const StyledInputNumber = styled(InputNumber)`
  display: flex;
  width: 90px;
  height: 40px;
  justify-content: flex-end;
  align-items: center;
  padding: 0;
  margin-right: 4px;

  .ant-input-number-input {
    width: 100%;
    text-align: right;
    padding-right: 34px;
  }
`;

const StyledTextBoxWrapper = styled.div`
  margin-right: 12px;
  &:last-child {
    margin-right: 0;
  }
`;

const StyledRow = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8;
`;

const StyledInputWrapper = styled.div`
  margin-bottom: 48px;
  position: relative;

  .ant-form-item-header {
    header {
      font-size: 24px;
      font-weight: 700;
      line-height: 36px;
    }
  }

  .ant-form-item-row {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .ant-form-item-control {
    width: 100%;
  }

  .ant-input {
    font-size: 16px;
  }
`;