import { Injectable } from "@nestjs/common";
import { AuthenticationService } from "../../authentication/authentication.service";
import { OtpRequestDto, SignupRequestDto } from "../../authentication/dto";
import * as qns from '../../common/onboarding_questionnaires/onboard.json';
import { UserOnboardingRepository } from "../repositories";

@Injectable()
export class UserOnboardingService {
  constructor(
    private readonly onboardRepo: UserOnboardingRepository,
    private authenticationService: AuthenticationService,

  ) {}

  async findStatus(userId: string) {
    if (!userId) {
      return this.constructResponse('Init')
    }

    return await this.onboardRepo.findByUserId(userId)
  }

  async updateProgress(data: any, userId: string) {
    data.userId = userId
    return this[`${data.step}Process`].call(this, data)
  }

  private async login(request) {
    const user = await this.authenticationService.mobileLogin(request.data.email, request.data.password)
    const step = await this.onboardRepo.findByUserId(user.id)
    return {
      completed: step.completed ? true : false,
      step: step.completed ? null : qns[step.nextStep]
    }
  }

  private async createAccountProcess(request) {
    // console.log(data)
    const dtoInstance = new SignupRequestDto()
    dtoInstance.firstName = request.data.firstName
    dtoInstance.lastName = request.data.lastName
    dtoInstance.email = request.data.email
    dtoInstance.password = request.data.password
    const userData = await this.authenticationService.signup(dtoInstance)
    // console.log(userData)
    const progressData = {
      userId: userData[0]['id'],
      data: {
        [request.step]: request.data
      },
      currentStep: request.step,
      nextStep: 'phoneVerifyInit'
    }
    if (userData) {
      await this.onboardRepo.create(progressData)
    }
    return {
      success: true,
      step: qns.phoneVerifyInit,
      next: true,
      data: {
        token: userData[0]['id']
      }
    }
  }

  private async phoneVerifyInitProcess(request) {
    const progressData = await this.onboardRepo.findByUserId(request.userId)
    if (!progressData) {
       return {
        success: false,
        step: qns.phoneVerifyInit,
        next: true,
        data: null,
        error: {
          message: 'Invalid Token'
        }
      }
    }

    if (progressData.nextStep !== request.step) {
      return {
        success: false,
        step: qns.phoneVerifyInit,
        next: true,
        data: null,
        error: {
          message: 'Invalid Step. Please retry again.'
        }
      }
    }
    const otpData = await this.authenticationService.sendOtp(request.data.phoneNumber)
    const prevData = progressData.data
    prevData['phoneVerifyInit'] = request.data
    const toUpdate = {
      currentStep: 'phoneVerifyInit',
      nextStep: 'phoneVerifyCheck',
      data: prevData
    }
    await this.onboardRepo.updateById(progressData.id, toUpdate)
    return {
      success: true,
      step: qns.phoneVerifyCheck,
      next: true,
      data: null,
    }
  }

  private async phoneVerifyCheckProcess(request) {
    const progressData = await this.onboardRepo.findByUserId(request.userId)
    if (!progressData) {
       return {
        success: false,
        step: qns.phoneVerifyCheck,
        next: true,
        data: null,
        error: {
          message: 'Invalid Token'
        }
      }
    }

    if (progressData.nextStep !== request.step) {
      return {
        success: false,
        step: qns.phoneVerifyCheck,
        next: true,
        data: null,
        error: {
          message: 'Invalid Step. Please retry again.'
        }
      }
    }
    const dtoInstance = new OtpRequestDto()
    dtoInstance.otp = request.data.otp
    dtoInstance.phoneNumber = request.data.phoneNumber
    const otpData = await this.authenticationService.verifySignUpOtp(dtoInstance, request.userId)
    const prevData = progressData.data
    prevData['phoneVerifyCheck'] = request.data
    const toUpdate = {
      currentStep: 'phoneVerifyCheck',
      nextStep: 'futureSignInOpt',
      data: prevData
    }
    await this.onboardRepo.updateById(progressData.id, toUpdate)
    return {
      success: true,
      step: qns.futureSignInOpt,
      next: true,
      data: null,
    }
  }

  private async futureSignInOptProcess(request) {
    const progressData = await this.onboardRepo.findByUserId(request.userId)
    if (!progressData) {
       return {
        success: false,
        step: qns.futureSignInOpt,
        next: true,
        data: null,
        error: {
          message: 'Invalid Token'
        }
      }
    }

    if (progressData.nextStep !== request.step) {
      return {
        success: false,
        step: qns.futureSignInOpt,
        next: true,
        data: null,
        error: {
          message: 'Invalid Step. Please retry again.'
        }
      }
    }

    const prevData = progressData.data
    prevData['futureSignInOpt'] = request.data
    const toUpdate = {
      currentStep: 'futureSignInOpt',
      nextStep: 'registationNumber',
      data: prevData
    }
    await this.onboardRepo.updateById(progressData.id, toUpdate)
    return {
      success: true,
      step: qns.registationNumber,
      next: true,
      data: null,
    }
  }

  private async registationNumberProcess(request) {
    const progressData = await this.onboardRepo.findByUserId(request.userId)
    if (!progressData) {
       return {
        success: false,
        step: qns.registationNumber,
        next: true,
        data: null,
        error: {
          message: 'Invalid Token'
        }
      }
    }

    if (progressData.nextStep !== request.step) {
      return {
        success: false,
        step: qns.registationNumber,
        next: true,
        data: null,
        error: {
          message: 'Invalid Step. Please retry again.'
        }
      }
    }

    const prevData = progressData.data
    prevData['registationNumber'] = request.data
    const toUpdate = {
      currentStep: 'registationNumber',
      nextStep: 'inputFullName',
      data: prevData
    }
    await this.onboardRepo.updateById(progressData.id, toUpdate)
    return {
      success: true,
      step: qns.inputFullName,
      next: true,
      data: null,
    }
  }

  private async inputFullNameProcess(request) {
    const progressData = await this.onboardRepo.findByUserId(request.userId)
    if (!progressData) {
       return {
        success: false,
        step: qns.registationNumber,
        next: true,
        data: null,
        error: {
          message: 'Invalid Token'
        }
      }
    }

    if (progressData.nextStep !== request.step) {
      return {
        success: false,
        step: qns.registationNumber,
        next: true,
        data: null,
        error: {
          message: 'Invalid Step. Please retry again.'
        }
      }
    }

    const prevData = progressData.data
    prevData['inputFullName'] = request.data
    const toUpdate = {
      currentStep: 'inputFullName',
      nextStep: 'inputNickName',
      data: prevData
    }
    await this.onboardRepo.updateById(progressData.id, toUpdate)
    return {
      success: true,
      step: qns.inputNickName,
      next: true,
      data: null,
    }
  }

  private async inputNickNameProcess(request) {
    const progressData = await this.onboardRepo.findByUserId(request.userId)
    if (!progressData) {
       return {
        success: false,
        step: qns.inputFullName,
        next: true,
        data: null,
        error: {
          message: 'Invalid Token'
        }
      }
    }

    if (progressData.nextStep !== request.step) {
      return {
        success: false,
        step: qns.inputFullName,
        next: true,
        data: null,
        error: {
          message: 'Invalid Step. Please retry again.'
        }
      }
    }

    const prevData = progressData.data
    prevData['inputNickName'] = request.data
    const toUpdate = {
      currentStep: 'inputNickName',
      nextStep: 'genderSelect',
      data: prevData
    }
    await this.onboardRepo.updateById(progressData.id, toUpdate)
    return {
      success: true,
      step: qns.genderSelect,
      next: true,
      data: null,
    }
  }

  private async genderSelectProcess(request) {
    const progressData = await this.onboardRepo.findByUserId(request.userId)
    if (!progressData) {
       return {
        success: false,
        step: qns.inputNickName,
        next: true,
        data: null,
        error: {
          message: 'Invalid Token'
        }
      }
    }

    if (progressData.nextStep !== request.step) {
      return {
        success: false,
        step: qns.inputNickName,
        next: true,
        data: null,
        error: {
          message: 'Invalid Step. Please retry again.'
        }
      }
    }

    const prevData = progressData.data
    prevData['genderSelect'] = request.data
    const toUpdate = {
      currentStep: 'genderSelect',
      nextStep: 'ethniticySelect',
      data: prevData
    }
    await this.onboardRepo.updateById(progressData.id, toUpdate)
    return {
      success: true,
      step: qns.ethniticySelect,
      next: true,
      data: null,
    }
  }

  private async ethniticySelectProcess(request) {
    const progressData = await this.onboardRepo.findByUserId(request.userId)
    if (!progressData) {
       return {
        success: false,
        step: qns.genderSelect,
        next: true,
        data: null,
        error: {
          message: 'Invalid Token'
        }
      }
    }

    if (progressData.nextStep !== request.step) {
      return {
        success: false,
        step: qns.genderSelect,
        next: true,
        data: null,
        error: {
          message: 'Invalid Step. Please retry again.'
        }
      }
    }

    const prevData = progressData.data
    prevData['ethniticySelect'] = request.data
    const toUpdate = {
      currentStep: 'ethniticySelect',
      nextStep: 'inputDOB',
      data: prevData
    }
    await this.onboardRepo.updateById(progressData.id, toUpdate)
    return {
      success: true,
      step: qns.inputDOB,
      next: true,
      data: null,
    }
  }

  private async inputDOBProcess(request) {
    const progressData = await this.onboardRepo.findByUserId(request.userId)
    if (!progressData) {
       return {
        success: false,
        step: qns.ethniticySelect,
        next: true,
        data: null,
        error: {
          message: 'Invalid Token'
        }
      }
    }

    if (progressData.nextStep !== request.step) {
      return {
        success: false,
        step: qns.ethniticySelect,
        next: true,
        data: null,
        error: {
          message: 'Invalid Step. Please retry again.'
        }
      }
    }

    const prevData = progressData.data
    prevData['inputDOB'] = request.data
    const toUpdate = {
      currentStep: 'inputDOB',
      nextStep: 'diabetesTypeSelect',
      data: prevData
    }
    await this.onboardRepo.updateById(progressData.id, toUpdate)
    return {
      success: true,
      step: qns.diabetesTypeSelect,
      next: true,
      data: null,
    }
  }

  private async diabetesTypeSelectProcess(request) {
    const progressData = await this.onboardRepo.findByUserId(request.userId)
    if (!progressData) {
       return {
        success: false,
        step: qns.inputDOB,
        next: true,
        data: null,
        error: {
          message: 'Invalid Token'
        }
      }
    }

    if (progressData.nextStep !== request.step) {
      return {
        success: false,
        step: qns.inputDOB,
        next: true,
        data: null,
        error: {
          message: 'Invalid Step. Please retry again.'
        }
      }
    }

    const prevData = progressData.data
    prevData['diabetesTypeSelect'] = request.data
    const toUpdate = {
      currentStep: 'diabetesTypeSelect',
      nextStep: 'diabetesConditionSelect',
      data: prevData
    }
    await this.onboardRepo.updateById(progressData.id, toUpdate)
    return {
      success: true,
      step: qns.diabetesConditionSelect,
      next: true,
      data: null,
    }
  }

  private async diabetesConditionSelectProcess(request) {
    const progressData = await this.onboardRepo.findByUserId(request.userId)
    if (!progressData) {
       return {
        success: false,
        step: qns.diabetesTypeSelect,
        next: true,
        data: null,
        error: {
          message: 'Invalid Token'
        }
      }
    }

    if (progressData.nextStep !== request.step) {
      return {
        success: false,
        step: qns.diabetesTypeSelect,
        next: true,
        data: null,
        error: {
          message: 'Invalid Step. Please retry again.'
        }
      }
    }

    const prevData = progressData.data
    prevData['diabetesConditionSelect'] = request.data
    const toUpdate = {
      currentStep: 'diabetesConditionSelect',
      nextStep: 'diabetesDiscoverySelect',
      data: prevData
    }
    await this.onboardRepo.updateById(progressData.id, toUpdate)
    return {
      success: true,
      step: qns.diabetesDiscoverySelect,
      next: true,
      data: null,
    }
  }

  private async diabetesDiscoverySelectProcess(request) {
    const progressData = await this.onboardRepo.findByUserId(request.userId)
    if (!progressData) {
       return {
        success: false,
        step: qns.diabetesConditionSelect,
        next: true,
        data: null,
        error: {
          message: 'Invalid Token'
        }
      }
    }

    if (progressData.nextStep !== request.step) {
      return {
        success: false,
        step: qns.diabetesConditionSelect,
        next: true,
        data: null,
        error: {
          message: 'Invalid Step. Please retry again.'
        }
      }
    }

    const prevData = progressData.data
    prevData['diabetesDiscoverySelect'] = request.data
    const toUpdate = {
      currentStep: 'diabetesDiscoverySelect',
      nextStep: 'studyGoalSelect',
      data: prevData
    }
    await this.onboardRepo.updateById(progressData.id, toUpdate)
    return {
      success: true,
      step: qns.studyGoalSelect,
      next: true,
      data: null,
    }
  }

  private async studyGoalSelectProcess(request) {
    const progressData = await this.onboardRepo.findByUserId(request.userId)
    if (!progressData) {
       return {
        success: false,
        step: qns.diabetesDiscoverySelect,
        next: true,
        data: null,
        error: {
          message: 'Invalid Token'
        }
      }
    }

    if (progressData.nextStep !== request.step) {
      return {
        success: false,
        step: qns.diabetesDiscoverySelect,
        next: true,
        data: null,
        error: {
          message: 'Invalid Step. Please retry again.'
        }
      }
    }

    const prevData = progressData.data
    prevData['studyGoalSelect'] = request.data
    const toUpdate = {
      currentStep: 'studyGoalSelect',
      nextStep: 'improvementChangeSelect',
      data: prevData
    }
    await this.onboardRepo.updateById(progressData.id, toUpdate)
    return {
      success: true,
      step: {
        "step": "improvementChangeSelect",
        "action": "submit",
        "messages": [
          {
            "id": 1,
            "text": "What single change would improve your life right now?",
            "type": "text"
          }
        ],
        "options": []
      },
      next: true,
      data: null,
    }
  }

  private async improvementChangeSelectProcess(request) {
    const progressData = await this.onboardRepo.findByUserId(request.userId)
    if (!progressData) {
       return {
        success: false,
        step: qns.studyGoalSelect,
        next: true,
        data: null,
        error: {
          message: 'Invalid Token'
        }
      }
    }

    if (progressData.nextStep !== request.step) {
      return {
        success: false,
        step: qns.studyGoalSelect,
        next: true,
        data: null,
        error: {
          message: 'Invalid Step. Please retry again.'
        }
      }
    }

    const prevData = progressData.data
    prevData['improvementChangeSelect'] = request.data
    const toUpdate = {
      currentStep: 'improvementChangeSelect',
      nextStep: 'learningReadinessScale',
      data: prevData
    }
    await this.onboardRepo.updateById(progressData.id, toUpdate)
    return {
      success: true,
      step: qns.learningReadinessScale,
      next: true,
      data: null,
    }
  }

  private async learningReadinessScaleProcess(request) {
    const progressData = await this.onboardRepo.findByUserId(request.userId)
    if (!progressData) {
       return {
        success: false,
        step: qns.improvementChangeSelect,
        next: true,
        data: null,
        error: {
          message: 'Invalid Token'
        }
      }
    }

    if (progressData.nextStep !== request.step) {
      return {
        success: false,
        step: qns.improvementChangeSelect,
        next: true,
        data: null,
        error: {
          message: 'Invalid Step. Please retry again.'
        }
      }
    }

    const prevData = progressData.data
    prevData['learningReadinessScale'] = request.data
    const toUpdate = {
      currentStep: 'learningReadinessScale',
      nextStep: 'learningInterestScale',
      data: prevData
    }
    await this.onboardRepo.updateById(progressData.id, toUpdate)
    return {
      success: true,
      step: qns.learningInterestScale,
      next: true,
      data: null,
    }
  }

  private async learningInterestScaleProcess(request) {
    const progressData = await this.onboardRepo.findByUserId(request.userId)
    if (!progressData) {
       return {
        success: false,
        step: qns.learningReadinessScale,
        next: true,
        data: null,
        error: {
          message: 'Invalid Token'
        }
      }
    }

    if (progressData.nextStep !== request.step) {
      return {
        success: false,
        step: qns.learningReadinessScale,
        next: true,
        data: null,
        error: {
          message: 'Invalid Step. Please retry again.'
        }
      }
    }

    const prevData = progressData.data
    prevData['learningInterestScale'] = request.data
    const toUpdate = {
      currentStep: 'learningInterestScale',
      nextStep: 'NULL',
      data: prevData,
      completed: true
    }
    await this.onboardRepo.updateById(progressData.id, toUpdate)
    return {
      success: true,
      step: null,
      next: false,
      data: null,
    }
  }

  private async findByUserId(userId: string) {
    return await this.onboardRepo.findByUserId(userId)
  }

  private constructResponse (identifier: string, inputData?: any) {
    return {
      completed: inputData?.completed ? true : false,
      step: this[`get${identifier}Response`].call(this)
    }

  }

  private getInitResponse () {
    return qns.intro
  }
}