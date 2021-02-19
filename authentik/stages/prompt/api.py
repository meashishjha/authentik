"""Prompt Stage API Views"""
from rest_framework.serializers import CharField, ModelSerializer
from rest_framework.validators import UniqueValidator
from rest_framework.viewsets import ModelViewSet

from authentik.flows.api.stages import StageSerializer
from authentik.stages.prompt.models import Prompt, PromptStage


class PromptStageSerializer(StageSerializer):
    """PromptStage Serializer"""

    name = CharField(validators=[UniqueValidator(queryset=PromptStage.objects.all())])

    class Meta:

        model = PromptStage
        fields = StageSerializer.Meta.fields + [
            "fields",
            "validation_policies",
        ]


class PromptStageViewSet(ModelViewSet):
    """PromptStage Viewset"""

    queryset = PromptStage.objects.all()
    serializer_class = PromptStageSerializer


class PromptSerializer(ModelSerializer):
    """Prompt Serializer"""

    promptstage_set = StageSerializer(many=True, required=False)

    class Meta:

        model = Prompt
        fields = [
            "pk",
            "field_key",
            "label",
            "type",
            "required",
            "placeholder",
            "order",
            "promptstage_set",
        ]


class PromptViewSet(ModelViewSet):
    """Prompt Viewset"""

    queryset = Prompt.objects.all().prefetch_related("promptstage_set")
    serializer_class = PromptSerializer
    filterset_fields = ["field_key", "label", "type", "placeholder"]
