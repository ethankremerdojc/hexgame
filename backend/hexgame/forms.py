from hexgame.models import *
from django import forms
from django.contrib.auth import get_user_model

User = get_user_model()

class CreateGameForm(forms.Form):
    title = forms.CharField(required=True)
    usernames = forms.CharField(
        help_text="Enter usernames seperated by commas, including yours. The turn order will be the order of the users."
    )

    minutes_per_turn = forms.IntegerField(min_value=1, max_value=200, initial=10, required=False)
    celldata = forms.CharField(widget=forms.HiddenInput(), required=True)
    cell_count = forms.IntegerField(min_value=10, max_value=200, initial=70)
    spectatable = forms.BooleanField(required=False, initial=True)

    def clean_usernames(self):
        raw_value = self.cleaned_data["usernames"]

        usernames = [u.strip() for u in raw_value.split(",") if u.strip()]
        if not usernames:
            raise forms.ValidationError("Enter at least one username.")

        # Optional: prevent duplicates in the submitted list
        duplicates_removed = list(dict.fromkeys(usernames))
        if len(duplicates_removed) != len(usernames):
            raise forms.ValidationError("Duplicate usernames were entered.")

        users = []
        missing = []
        for username in usernames:
            try:
                users.append(User.objects.get(username=username))
            except User.DoesNotExist:
                missing.append(username)

        if len(missing) > 0:
            raise forms.ValidationError(
                f"These users do not exist: {', '.join(missing)}"
            )

        return users

class GameInfoForm(forms.ModelForm):

    class Meta:
        model = Game
        fields = ["title", "spectatable"]
