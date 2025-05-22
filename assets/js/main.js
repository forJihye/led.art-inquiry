// 폼 요소 값 확인인
const isNull = (value) => {
  if (value === null || typeof value === 'undefined') return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length < 1) return true;
  return false
}
// 이메일 주소 유효성 검사 정규식
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const inquiryStepDisplay = () => {
  /**
   * <main data-step="step1"> 
   * main 태그의 data-step 속성값과 동일한 id의 div요소 보임처리
   */
  const root = document.querySelector('main');
  const currentStep = root.dataset.step;
  
  const target = document.getElementById(`${currentStep}`);
  if (!target) return false;

  target.style.display = 'block';
  [...target.parentElement.children].forEach(el => {
    if (el.getAttribute('id') === currentStep) return false;
    el.style.display = 'none';
  })
}

const nextStep = (stepValue) => {
  const root = document.querySelector('main');
  root.dataset.step = stepValue;
  inquiryStepDisplay();
}

// 입력폼 유효성 검사
const validateField = ({ 
  elementId, 
  parentSelector, 
  messageSelector = '.vaild-message', 
  type = null 
}) => {
  const element = document.getElementById(elementId);
  const parent = parentSelector ? document.querySelector(parentSelector) : element.parentElement;
  const message = parent.querySelector(messageSelector);
  if (!element || !message) return false;
  // console.log("validateField", element, message, element.value);
  if (isNull(element.value)) {
    message.style.display = 'block';
    element.style.borderColor = "#ff0000";
    return false;
  } 
  // 타입별 형식 검사
  if (type === 'email' && !isValidEmail(element.value)) {
    message.style.display = 'block';
    element.style.borderColor = "#ff0000";
    return false;
  }
  message.style.display = 'none';
  element.style.borderColor = "#ccc"
  return true;
};

const validateFieldsGroup = (fields) => {
  let isAllValid = true;
  for (const field of fields) {
    const isValid = validateField(field);
    if (!isValid) isAllValid = false;
  }
  return isAllValid;
};

// 약관 체크박스 전체선택 처리
const allCheckboxChange = () => {
  const checkAll = document.getElementById('all-check');
  const checkItems = [...document.querySelectorAll('input[name^="agree"]')];
  const message = document.querySelector('.agree-msg');

  checkAll.onchange = (ev) => {
    checkItems.forEach(async (item) => item.checked = ev.target.checked)
    if (ev.target.checked && message.style.display === 'block') message.style.display = 'none';
  };

  checkItems.forEach(item => {
    item.onchange = () => checkAll.checked = checkItems.every(item => item.checked);
  })
}

// 약관 체크박스 상태 확인
const termsCheckValid = ({ 
  parentSelector, 
  messageSelector = '.agree-msg' 
}) => {
  const parent = document.querySelector(parentSelector); // 'input[name="agree"][required]'
  const checkboxs = parent.querySelectorAll('input[type="checkbox"][required]');
  const message = document.querySelector(messageSelector); // agree-msg
  const isCheck = [...checkboxs].every(el => el.checked);

  if (!isCheck) {
    message.style.display = 'block';
    return false;
  } else {
    message.style.display = 'none';
    return true;
  }
}

// step1: 작품 기간 
const validationStep1 = () => {
  const isValid = validateFieldsGroup([{ 
    elementId: 'duration', 
    parentSelector: '#step1' 
  }]);
  if (isValid) nextStep("step2");
};

// step2: 이름 + 이메일 + 약관동의
const validationStep2 = () => {
  const isValid = validateFieldsGroup([
    { elementId: 'orderNm' },
    { elementId: 'email', type: 'email' },
  ]);
  const isCheck = termsCheckValid({
    parentSelector: '#step2',
  });

  if (isValid && isCheck) {
    // 폼 데이터 전송
    // console.log($('#inquiry-form').serialize());

    // 완료화면 이동
    nextStep("step3");
  }
};

// 트리거 이벤트 구분하여 유효성 검사
const setupValidationEvents = () => {
  document.getElementById("step1-btn").addEventListener('click', validationStep1);
  document.getElementById("step2-btn").addEventListener('click', validationStep2);

  // Step1: 작품 기간 select 박스
  document.getElementById('duration').addEventListener('change', () => {
    validateField({
      elementId: 'duration',
      parentSelector: '#step1',
    });
  });

  // Step2: 문의폼 
  ['orderNm', 'email'].forEach(id => {
    const input = document.getElementById(id);
    input.addEventListener('input', () => {
      validateField({ 
        elementId: id,
        ...(id === 'email' && {type: "email"})
      });
    });
  });
};

// 메인 함수
const main = async() => {try {
  // bootstrap-select
  $('.selectpicker').selectpicker();

  // 초기 문의 Step 단계별 디스플레이 처리 
  inquiryStepDisplay();

  // 약관 체크박스 전체선택
  allCheckboxChange();

  // 입력폼 유효성 검사
  setupValidationEvents();
} catch(err){
  console.error(err);
}}
main();
